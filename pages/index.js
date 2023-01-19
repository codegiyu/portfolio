import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../components/Header'
import Intro from '../components/Intro'
import CircleLink from '../components/CircleLink'
import ProfilePhoto from '../components/ProfilePhoto'
import SectionHeader from '../components/SectionHeader'
import SkillsList from '../components/SkillsList'
import WorkSlideshow from '../components/WorkSlideshow'
import PROJECTS, { SKILLS } from '../data/data'
import ContactHeader from '../components/ContactHeader'
import ContactForm from '../components/ContactForm'
import Footer from '../components/Footer'
import useScrollBlock from '../components/hooks/useScrollBlock'

export default function Home() {
  let [menuOpen, setMenuOpen] = useState(false)
  let [isScrolled, setIsScrolled] = useState(false)
  let [windowWidth, setWindowWidth] = useState(0)
  let [topPositions, setTopPositions] = useState({about: 0, services: 0, works: 0, contact: 0})
  let [pageScrollPosition, setPageScrollPosition] = useState(0)

  const [blockScroll, allowScroll] = useScrollBlock()

  let aboutRef = useRef()
  let servicesRef = useRef()
  let worksRef = useRef()
  let contactRef = useRef()

  let headerProps = {
    menuOpen, 
    setMenuOpen, 
    refs: {
      about: aboutRef,
      services: servicesRef,
      works: worksRef,
      contact: contactRef
    }, 
    topPositions,
    pageScrollPosition
  }
  let skillsHeaderProps = {small: "Services", large: "Skill-Set"}
  let projectsHeaderProps = {small: "Works", large: "Recent Projects"}

  let headerPosition = isScrolled ? "fixed top-0  py-4" : "py-8"

  const handleScroll = () => {
    const offset = window.pageYOffset
    setPageScrollPosition(offset)
    offset > 70 ? setIsScrolled(true) : setIsScrolled(false)
  }

  const handleResize = () => {
    setWindowWidth(window.innerWidth)
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    console.log(windowWidth)
    setTopPositions({
      about: aboutRef.current.offsetTop,
      services: servicesRef.current.offsetTop,
      works: worksRef.current.offsetTop,
      contact: contactRef.current.offsetTop
    })
  },[windowWidth])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
  })

  useEffect(() => {
    menuOpen ? blockScroll() : allowScroll()
  }, [menuOpen, allowScroll, blockScroll])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
  })

  return (
    <div className={"bg-darkBg min-h-screen w-full"}>
      <Head>
        <title>CodeGiyu - React Developer</title>
        <meta name="description" content="I'm Codegiyu, a Frontend React Developer. I build beautiful, fun and interactive things with code. Programmer portfolio website built with NextJS and Tailwind CSS." />
        <meta name="google-site-verification" content="mVKUksXdW1OhGyyAi4-iO8CT6zjQTo4uOK8GFwQUI8A" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="codegiyu, portfolio, react, developer, frontend" />
        <meta name="author" content="Edward-Precious Omegbu Codegiyu" />
        <meta property="og:type" content="portfolio" />
        <meta property="og:title" content="CodeGiyu - React Developer" />
        <meta property="og:description" content="I'm Codegiyu, a Frontend React Developer. I build beautiful, fun and interactive things with code. Programmer portfolio website built with NextJS and Tailwind CSS." />
        <meta property="og:image" content="https://res.cloudinary.com/diirhfihi/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1669041238/codegiyu2_caxu3o.jpg" />
        <meta property="og:url" content="https://portfolio-codegiyu.vercel.app" />
        <meta name="twitter:card" content="portfolio" />
        <meta name="twitter:title" content="CodeGiyu - React Developer" />
        <meta name="twitter:url" content="https://portfolio-codegiyu.vercel.app" />
        <meta name="twitter:site" content="@TheLonerider20" />
        <meta name="twitter:description" content="I'm Codegiyu, a Frontend React Developer. I build beautiful, fun and interactive things with code. Programmer portfolio website built with NextJS and Tailwind CSS." />
        <meta name="twitter:image" content="https://res.cloudinary.com/diirhfihi/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1669041238/codegiyu2_caxu3o.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <header className={`w-full px-4 sm:px-8 md:px-16 lg:px-[2.5rem] xl:px-16 bg-darkBg z-50 ${headerPosition}`}>
        <ErrorBoundary>
          <Header props={ headerProps } />
        </ErrorBoundary>
      </header>

      <main className={"w-full z-[1] mt-1"}>
        <section id="about" ref={aboutRef} className="px-4 sm:px-8 md:px-16 lg:px-[2.5rem] xl:px-16 flex flex-col items-center gap-10 lg:flex-row 
          lg:gap-16 lg:items-center lg:justify-between py-12"
        >
          <div className="flex-1">
            <ErrorBoundary>
              <Intro />
            </ErrorBoundary>
          </div>
          <div className="w-auto hidden lg:block">
            <ErrorBoundary>
              <CircleLink num="1" />
            </ErrorBoundary>
          </div>
          <div className="w-full md:w-[400px] lg:w-[375px] xl:w-[450px]">
            <ErrorBoundary>
              <ProfilePhoto />
            </ErrorBoundary>
          </div>
        </section>
        <section id="services" ref={servicesRef} className="px-4 sm:px-8 md:px-16 lg:px-[2.5rem] xl:px-16 flex flex-col gap-16 py-12 my-12 lg:my-28">
          <div className="">
            <ErrorBoundary>
              <SectionHeader props={ skillsHeaderProps } />
            </ErrorBoundary>
          </div>
          <div className="flex gap-6 lg:items-center">
            <ErrorBoundary>
              <SkillsList array={ SKILLS } />
            </ErrorBoundary>
            <div className="w-auto hidden lg:block">
              <ErrorBoundary>
                <CircleLink num="2" />
              </ErrorBoundary>
            </div>
          </div>
        </section>
        <section id="works" ref={worksRef} className="px-4 sm:px-8 md:px-16 lg:px-[2.5rem] xl:px-16 flex flex-col gap-16 py-12 my-12 lg:my-28">
          <div className="">
            <ErrorBoundary>
              <SectionHeader props={ projectsHeaderProps } />
            </ErrorBoundary>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex-1">
              <ErrorBoundary>
                <WorkSlideshow array={PROJECTS} />
              </ErrorBoundary>
            </div>
            <div className="w-auto flex-none hidden lg:block">
              <ErrorBoundary>
                <CircleLink num="3" />
              </ErrorBoundary>
            </div>
          </div>
        </section>
        <section id="contact" ref={contactRef} className=" flex flex-col gap-16 py-12 my-4 bg-dark">
          <div className="flex justify-center">
            <ErrorBoundary>
              <ContactHeader />
            </ErrorBoundary>
          </div>
          <div className="px-4 sm:px-8 md:px-16 lg:px-[2.5rem] xl:px-16 w-full sm:w-[450px] md:w-[600px] lg:w-full xl:w-[1100px] mx-auto">
            <ErrorBoundary>
              <ContactForm />
            </ErrorBoundary>
          </div>
        </section>
      </main>

      <footer className={"px-4 sm:px-8 md:px-16 lg:px-[2.5rem] xl:px-16 w-full"}>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </footer>
    </div>
  )
}
