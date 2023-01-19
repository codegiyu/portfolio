import Image from "next/image";
import { useState } from "react";

const SkillsBox = ({ props }) => {
    let {source, name} = props

    let [isHovered, setIsHovered] = useState(false)

    const handleMouseEnter = () => setIsHovered(true)

    const handleMouseLeave = () => setIsHovered(false)

    let imageClass = isHovered ? "animate-[spin_5s_ease-in-out_infinite] transition-all duration-1000" 
                                : "transition-all duration-1000 animate-[spin_5s_ease-in-out] animation-once"

    return (
        <div className="flex items-center justify-center gap-2 lg:gap-3 min-w-[140px] xs:min-w-[48.5%] sm:min-w-[160px] md:min-w-[160px] 
        lg:min-w-[200px] max-w-max py-6 md:py-8 lg:py-12 px-2 lg:px-4 rounded-[8px] bg-dark drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] 
        transform-style-3d perspective-1000 hover:scale-y-95 z-0"
         onMouseEnter={ handleMouseEnter } 
         onMouseLeave={ handleMouseLeave }
        >
            <div className="relative w-9 lg:w-12 aspect-square">
                <Image src={ source } fill className={ imageClass } alt={ name } loading="eager" />
            </div>
            <p className="text-xs md:text-sm lg:text-[16px] leading-[100%] font-medium font-montserrat text-[#FAFAFA]">{ name }</p>
        </div>
    )
}

export default SkillsBox