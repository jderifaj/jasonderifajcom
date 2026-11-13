/** Recommendations from colleagues, quoted as written. */

export interface Recommendation {
	quote: string;
	/** The words that fall from the panel title into the quote: copied exactly from `quote`. */
	highlight: string;
	name: string;
	role: string;
}

export const recommendations: Recommendation[] = [
	{
		name: 'Vetry Ramachandran',
		role: 'Group Creative Director - ICF',
		highlight: 'delivered high-quality work',
		quote:
			'Dear Jason, I wanted to express my sincere appreciation for your outstanding work on the PSEG Enterprise Brand Hub launch. You went over and above to help pull off what could have easily been a 6-month process. You delivered high-quality work in a crunch time, which is truly impressive, and your professionalism and collaboration throughout the project were very much appreciated. Thank you for your exceptional contribution.',
	},
	{
		name: 'Kelley Pressey',
		role: 'Lead Community Development Specialist - ICF',
		highlight: 'repeatedly done amazing work',
		quote:
			"Jason has repeatedly done amazing work for the HUD Exchange. From streamlining web design and coding processes, to producing innovative, creative, and modern solutions to our client's requests. He is an instrumental asset to the team as he continues to push the boundary of what we have done to what we could do. Recently, he's been working on producing beautiful interactive web pages for our client that will allow enhanced engagement on the site. Jason, I look forward to the continued innovation!",
	},
	{
		name: 'Billy Weinheimer',
		role: 'Senior Art Director - ICF',
		highlight: 'brings a positive energy',
		quote:
			'Jason is always available to work out a problem, come up with a new solution, and try a different approach to come up with the best way forward. He is excited to be involved in new projects and brings a positive energy which is great to work with. I would recommend having Jason on any team.',
	},
	{
		name: 'Kaipeng Yu',
		role: 'Web Digital Graphic Manager - ICF',
		highlight: 'always enthusiastic about exploring new technologies',
		quote:
			"It's my great pleasure to work with Jason on a variety of projects, including DTE, HUD, NYCA, EPA, etc. Jason is an excellent front-end developer who is always enthusiastic about exploring new technologies and who can always figure out the core frameworks and logistics within a complex system and generate a simplified demo out of it. I learned lots of cool libraries and front-end practices when I worked with Jason, such as GreenSocks, which also facilitated my other front-end works, specifically micro-interactions and animations. I also want to highlight Jason's focus on accessibility, which can be very complicated in certain cases. Jason is very familiar with the best practices and is always able to provide good solutions. I am so glad we have Jason in our group.",
	},
	{
		name: 'Michelle Rush',
		role: 'Business Analyst - ICF',
		highlight: 'excellent collaborator',
		quote:
			"Jason is an excellent collaborator and is consistently praised by our Gateway clients for his high quality work and quick turnaround. He recently exceeded the clients' expectations by turning around a number of slick website enhancements in a very short period of time. They continue to express gratitude for the impact that those enhancements had on the site. Jason is excellent at recommending various designs to help the client visualize and make informed decisions. Great collaboration Jason!",
	},
	{
		name: 'Carey Hartmann',
		role: 'Senior Manager for Software Application Engineering - ICF',
		highlight: 'trust his judgment',
		quote:
			'Jason jumped in to help with an important task LOE on short notice and completed the review and initial LOE, including probable tasks and assumptions so quickly that the requestor was shocked and amazed. It was great to know that I could trust his judgment and ability and even better when he far exceeded expectations by delivering well ahead of time.',
	},
	{
		name: 'Ryan Spitzel',
		role: 'Graphic Designer',
		highlight: 'create exceptional work',
		quote:
			"Working with Jason is always a joy! He is great at working under pressure, I know this because pretty much every project I've been on with him has had a timeline that is really fast paced. When he is not under a super tight timeline he is able to create exceptional work, helping bridge the gap between designer and developer. He always does a wonderful job of capturing the designers UI and turning it into something usable while adding his own flare. Keep up the great work!",
	},
];
