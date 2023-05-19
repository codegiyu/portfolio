import Image from "next/image";

const WorkSingle = ({props}) => {
    let {img, title, description, skills, link} = props

    return (
        <div className="w-full flex-none flex flex-col rounded-[20px] bg-dark text-center text-ash font-montserrat 
            overflow-hidden pb-8"
        >
            <div className={`w-full aspect-[1.8] relative bg-cover bg-center`} style={{ backgroundImage: `url(${img})` }}>
                {/* <Image src={ img } alt={title} fill loading="eager" priority /> */}
            </div>
            <a href={ link }><h3 className="text-red text-2xl lg:text-[32px] hover:underline hover:underline-offset-8 font-bold my-4">{ title }</h3></a>
            <p className="text-sm lg:text-base font-semibold">{ description }</p>
            <div className="flex justify-center gap-4 lg:gap-8 items-center mt-6">
                { skills.map((item,idx) => (
                        <div key={title + idx + 100} className="relative w-[30px] lg:w-[40px] aspect-square">
                            <Image key={title + idx} alt="skill" src={ item } fill />
                        </div>
                    )
                ) }
            </div>
        </div>
    )
}

export default WorkSingle