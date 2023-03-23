// import lendsqr from "../public/images/projects/lendsqr.png";

export const SKILLS = [
    {source: "/images/skills/html5.svg", name: "HTML5"},
    {source: "/images/skills/css3.svg", name: "CSS3"},
    {source: "/images/skills/javascript.svg", name: "JavaScript"},
    {source: "/images/skills/typescript.svg", name: "TypeScript"},
    {source: "/images/skills/scss.svg", name: "Scss"},
    {source: "/images/skills/bootstrap.svg", name: "Bootstrap 5"},
    {source: "/images/skills/tailwindcss.svg", name: "TailwindCSS"},
    {source: "/images/skills/jquery.svg", name: "JQuery"},
    {source: "/images/skills/react.svg", name: "React JS"},
    {source: "/images/skills/nextjs.svg", name: "Next JS"},
    {source: "/images/skills/nodejs.svg", name: "Node JS"},
    {source: "/images/skills/express.svg", name: "Express JS"},
    {source: "/images/skills/mongodb.svg", name: "Mongo DB"},
    // {source: "/images/skills/php.svg", name: "PHP"},
    // {source: "/images/skills/mysql.svg", name: "MySQL"},
]

const PROJECTS = [
    {
        img: "/images/projects/lendsqr.png", 
        title: "Lendsqr Users Dashboard", 
        description: "Mock simple website for Lendsqr Users Dashboard", 
        skills: [
            "/images/skills/react.svg", "/images/skills/typescript.svg", "/images/skills/scss.svg"],
        link: "https://edward-precious-omegbu-lensqr-fe-test.vercel.app"
    },
    {
        img: "/images/projects/mentro.png", 
        title: "Mentro", 
        description: "Mentro mentors picture carousel with neat transitions", 
        skills: [
            "/images/skills/react.svg", "/images/skills/scss.svg"],
        link: "https://mentro-challenge.vercel.app"
    },
    {
        img: "/images/projects/debt-management.png", 
        title: "Debt Management", 
        description: "Mock simple website for Debt Management Office Nigeria", 
        skills: [
            "/images/skills/react.svg", "/images/skills/tailwindcss.svg", "/images/skills/nodejs.svg", "/images/skills/express.svg",
            "/images/skills/mongodb.svg"],
        link: "https://debt-management.vercel.app"
    },
    {
        img: "/images/projects/musica.png", 
        title: "Musica", 
        description: "Music streaming website with Spotify API", 
        skills: [
            "/images/skills/react.svg", "/images/skills/tailwindcss.svg", "/images/skills/javascript.svg"
        ],
        link: "https://musica-challenge.vercel.app"
    },
    {
        img: "/images/projects/trivia.PNG", 
        title: "Trivia Quiz", 
        description: "Multichoice tivia quiz with different categories and questions fetched online", 
        skills: [
            "/images/skills/html5.svg", "/images/skills/css3.svg", "/images/skills/javascript.svg", "/images/skills/bootstrap.svg"
        ],
        link: "https://codegiyu.github.io/games/trivia.html"
    },
    {
        img: "/images/projects/omorofan.jpg", 
        title: "Omorofan", 
        description: "Company website for Omorofan EMT Nig Ltd", 
        skills: [
            "/images/skills/html5.svg", "/images/skills/css3.svg", "/images/skills/javascript.svg", 
            "/images/skills/jquery.svg", "/images/skills/php.svg"
        ],
        link: "http://omorofan.com.ng"
    }
]

export default PROJECTS