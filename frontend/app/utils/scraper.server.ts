import * as CSSSelect from "css-select"
import { DomHandler } from "domhandler"
import * as DomUtils from "domutils"
import { Parser } from "htmlparser2"

/* I know there's at least two different city-council agenda formats in the
 * archives on the city website, so an enum here is just a bit of future-proofing */
type AgendaVersion =
	| 1

// @ts-ignore -- will fix later
const _enhance = (el) => {
	if (el.__enhanced) {
		return el;
	}

	el.__enhanced = true;
	el.querySelector = function(selector: string) {
		const res = CSSSelect.selectOne(selector, el);

		if (res) {
			_enhance(res);
		}

		return res;
	}; // bind?
	el.querySelectorAll = function(selector: string) {
		const res = CSSSelect.selectAll(selector, el);
		const rc = res.map(_enhance);

		Object.defineProperty(rc, "item", {
			get() {
				return (idx: number) => rc[idx];
			}
		});

		return rc;
	};
	el.closest = function(selector: string) { // FIXME: horrible
		let p = _enhance(DomUtils.getParent(el));

		while (p && p.tagName !== selector) {
			p = _enhance(DomUtils.getParent(p));
		}

		return p;
	};
	el.getAttribute = function(attr: string) {
		return DomUtils.getAttributeValue(el, attr);
	};
	Object.defineProperties(el, {
		"innerHTML": {
			get() {
				return DomUtils.getInnerHTML(this);
			}
		},
		"nextElementSibling": {
			get() {
				return _enhance(DomUtils.nextElementSibling(this));
			}
		},
		"outerHTML": {
			get() {
				return DomUtils.getOuterHTML(this);
			}
		},
		"parentElement": {
			get() {
				return _enhance(DomUtils.getParent(this));
			}
		},
		"previousElementSibling": {
			get() {
				return _enhance(DomUtils.prevElementSibling(this));
			}
		},
		"tagName": {
			get() {
				return this.name;
			}
		},
		"textContent": {
			get() {
				return DomUtils.textContent(this);
			}
		}
	});

	return el;
};

const normalizeText = (str: string) => {
	return str
		?.replaceAll(/[\r\n]+/g, " ")
		?? ""
}

export function processDocument(doc: string) {
	return new Promise<Document>((resolve, reject) => {
		const handler = new DomHandler((error, dom) => {
			if (error) {
				reject(error);
			}
			else {
				resolve(_enhance(dom));
			}
		});
		const parser = new Parser(handler);

		parser.write(doc);
		parser.end();
	});
}

export function getDocumentVersion(document: Document): AgendaVersion {
	if (!document) {
		throw new Error("no document provided")
	}

	return 1
}

const dateFns: Record<AgendaVersion, ((document: Document) => Date)> = {
	1: (document) => {
		const el = document.querySelector("table table:first-child tr:nth-child(3)")

		if (!el) {
			throw new Error("query selector did not match an element")
		}
		else if (el.textContent === null) {
			throw new Error("element has no text content")
		}

		/* warning: server-local timezone applied */
		return new Date(el.textContent)
	},
}

export function getDate(document: Document, version: AgendaVersion) {
	return dateFns[version](document)
}

const councilorFns = {
	1: (document: Document) => {
		const els = [ ...document.querySelectorAll("table table:nth-child(3) tr") ]

		if (els.length === 0) {
			throw new Error("query selector did not match an element")
		}

		const headerIndex = els.findIndex(
			(el) => el.innerHTML.includes("Councilors")
		)

		if (headerIndex === -1) {
			throw new Error("could not find header <td>")
		}

		return els.slice(headerIndex + 1)
			.flatMap((el) => [ ...el.querySelectorAll("td") ])
			.filter((el) => !el.querySelector("b"))
			.map((el) => {
				const name = el.querySelector("font")?.textContent?.trim()

				if (!name) {
					throw new Error("could not find name text")
				}

				return {
					name
				}
			})
	}
}

export function getCouncilors(document: Document, version: AgendaVersion) {
	return councilorFns[version](document)
}

const mayorFns = {
	1: (document: Document) => {
		const els = [ ...document.querySelectorAll("table table:nth-child(3) tr:first-child td:first-child font") ]

		if (!els.length) {
			throw new Error("query selector did not match an element")
		}

		const name = els.at(-1)?.textContent?.trim()

		if (!name) {
			throw new Error("could not find name text")
		}

		return {
			name
		}
	}
}
export function getMayor(document: Document, version: AgendaVersion) {
	return mayorFns[version](document)
}

const agendaItemFns = {
	1: (document: Document) => {
		const agendaItems = [ ...document.querySelectorAll("table table tr:has(a)") ]
			.slice(1) /* remove element containing city seal and muni site url */
		
		if (agendaItems.length === 0) {
			throw new Error("could not find agenda items")
		}

		return agendaItems.map((item) => {
			const cells = [ ...item.querySelectorAll("td") ]
			/* "depth" is the index of the first non-empty `<td>` */
			const headingDepth = cells.findIndex((td) => !!td.textContent?.length)

			if (headingDepth === -1) {
				throw new Error("couldn't calculate heading depth for: " + item.textContent)
			}

			const rawItemId = cells[headingDepth]?.textContent?.trim()

			if (!rawItemId) {
				throw new Error("couldn't calculate agenda item number for: " + item.textContent)
			}

			const nextCells = [
				...(item.nextElementSibling?.querySelectorAll("td") ?? [])
			]
			const hasResolution = nextCells.findIndex(
				(el) => !!el.textContent
			) === headingDepth + 1
			const resolutionText = hasResolution
				? normalizeText(nextCells[headingDepth + 1]?.textContent ?? "")
				: ""
			const attachmentUrl = item.querySelector("a")?.getAttribute("href")

			if (!attachmentUrl) {
				throw new Error("couldn't find agenda-item url for: " + item.textContent)
			}

			const documentId = new URLSearchParams(attachmentUrl.split("?")[1]).get("unique_id")

			if (!documentId) {
				throw new Error("couldn't find system id for: " + item.textContent)
			}
			const text = normalizeText(cells.at(-2)?.textContent ?? "")

			if (!text) {
				throw new Error("couldn't find agenda-item text for: " + item.textContent)
			}

			const rawSections = []

			/* walk up the DOM to find the section for this agenda item */
			for (let i = headingDepth - 1; i >= 0; i--) {
				let tableEl = item.closest("table")?.previousElementSibling;

				if (!tableEl) {
					throw new Error("couldn't calculate agenda item number for: " + item.textContent)
				}

				while (tableEl && !(tableEl.querySelector(`tr:last-child td:nth-child(${i+1})`)?.textContent?.length)) {
					tableEl = tableEl.previousElementSibling;
				}

				if (!tableEl) {
					break;
				}

				rawSections.unshift(
					[ ...tableEl.querySelectorAll(`tr:last-child > td`) ]
						.map((td) => td.textContent?.trim().split("\n").filter(Boolean))
						.filter(Boolean)
						.flat()
				)
			}

			const sections = rawSections.map((el) => {
				if (!el[1]) {
					throw new Error("no sections found for " + item.textContent)
				}

				const mainText = el[1].split(/[^A-Z' ]/)

				if (!mainText[0]) {
					throw new Error("couldn't find main-text section name for: " + item.textContent)
				}

				return mainText[0].trim()
			})

			/* if the agenda item id doesn't start with a number (e.g. "8k." vs "A.")
			 * then assume it's a nested subsection and combine it with the item's
			 * parent's section number */
			const itemId = rawItemId.match(/^\d+[a-zA-Z]+?\.$/)
				? rawItemId
				: `${rawSections.at(-1)?.[0]}.${rawItemId}`

			return {
				attachmentUrl,
				documentId,
				itemId,
				resolutionText,
				sections,
				text
			}
		})
	}
}

export function getAgendaItems(document: Document, version: AgendaVersion) {
	return agendaItemFns[version](document)
}
