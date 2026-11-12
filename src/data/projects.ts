/**
 * Curated work, newest first.
 *
 * Each project needs a screenshot at src/assets/images/work/<slug>.webp,
 * captured at 2x and cropped to 75:40 (for example 2048 × 1092).
 */

export interface EarlierIssue {
	slug: string;
	label: string;
	/** Read by screen readers before the label, e.g. "The Efficient Home, Issue 4". */
	series: string;
	year: number;
	url: string;
}

export interface Project {
	slug: string;
	title: string;
	/** Describes what the screenshot shows; the title is already the link text. */
	alt: string;
	year: number;
	/** The live site. Leave it out when there's nothing to link to: the row then shows `noLink` instead. */
	url?: string;
	/** Shown in place of the link when there's no `url`. Defaults to "No live site". */
	noLink?: string;
	/** Earlier editions, listed in a strip under the project instead of as rows of their own. */
	earlier?: EarlierIssue[];
}

const bgeIssue = (issue: number, year: number): EarlierIssue => ({
	slug: `bge-issue${issue}`,
	label: `Issue ${issue}`,
	series: 'The Efficient Home, BGE',
	year,
	url: `https://bge.theefficienthome.com/issue${issue}/`,
});

export const projects: Project[] = [
	{
		slug: 'bge-winter',
		title: 'Winter Tips, BGE',
		alt: 'Winter Tips, Neighbor-to-Neighbor headline with snow piled on it, beside a neighbor on a snowy Baltimore street',
		year: 2026,
		// Link to come.
		noLink: 'Link coming soon',
	},
	{
		slug: 'alexrenew',
		title: 'AlexRenew',
		alt: 'AlexRenew homepage with a technician servicing plant pipework',
		year: 2026,
		url: 'https://www.alexrenew.com/',
	},
	{
		slug: 'comed-feature',
		title: 'The Efficient Home, Issue 2 Feature, ComEd',
		alt: 'ComEd Efficient Home feature page, “Every Neighbor Has a Story”',
		year: 2026,
		url: 'https://comed.theefficienthome.com/issue2/feature.html',
	},
	{
		slug: 'bge-issue5',
		title: 'The Efficient Home, Issue 5, BGE',
		alt: 'Efficient Home Issue 5 cover story with a father and son gardening',
		year: 2026,
		url: 'https://bge.theefficienthome.com/issue5/',
		earlier: [bgeIssue(4, 2025), bgeIssue(3, 2024), bgeIssue(2, 2023), bgeIssue(1, 2022)],
	},
	{
		slug: 'jerseyready',
		title: 'Jersey Ready, PSEG',
		alt: 'Jersey Ready homepage video still of a home at dusk',
		year: 2025,
		url: 'https://njready.com/',
	},
	{
		slug: 'comeonin',
		title: 'Come On In Campaign, BGE',
		alt: 'Come On In campaign homepage with colorful Baltimore rowhouses',
		year: 2025,
		url: 'https://bgesmartenergy.com/comeonin/index.html',
	},
	{
		slug: 'dallas',
		title: 'Dallas Street to Home Initiative',
		alt: 'Dallas Street to Home interactive overview with section navigation',
		year: 2025,
		// Never launched, and now behind a login: the case study tells the story instead.
	},
	{
		slug: 'hud-pp',
		title: 'Project Profiles, HUD',
		alt: 'HUD project profile for the Aurora Arts Center in Aurora, Illinois',
		year: 2024,
		url: 'https://www.hudexchange.info/programs/section-108/project-profiles/',
	},
	{
		slug: 'dccps24',
		title: 'Div of Cancer Control, National Cancer Institute',
		alt: '2024 cancer control highlights title page, “Putting the National Cancer Plan into Action”',
		year: 2024,
		url: 'https://cancercontrol.cancer.gov/overview-highlights/2024/',
	},
	{
		slug: 'dccps23',
		title: 'Div of Cancer Control, National Cancer Institute',
		alt: '2023 cancer control highlights with an illustrated mountain',
		year: 2023,
		url: 'https://cancercontrol.cancer.gov/overview-highlights/2023/',
	},
	{
		slug: 'refresh',
		title: 'We hit refresh, PSEG',
		alt: 'PSEG brand hub, “We hit refresh”, with a worker on a rooftop at sunset',
		year: 2023,
		url: 'https://brandhub.pseg.com/public/index.html',
	},
];
