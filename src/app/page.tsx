import Steam from "@/lib/components/Steam";

const timeline = [
    ["LSU MATH", "Undergrad Research"],
    ["FAST Enterprises", "Implementation Consultant Intern for Illinois Tax"],
    ["LSU", "B.S. College Science & Engineering"],
  ];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10">
      <div className="flex w-full flex-col items-center">
        <div className="w-full max-w-full bg-linear-to-r from-rose via-love to-foam bg-size-[200%_200%] animate-shift bg-clip-text p-4 text-center text-4xl font-extrabold text-transparent sm:p-8 sm:text-5xl">
          <h1 className="wrap-break-word">Quentin Bordelon</h1>
        </div>

        <div className="flex w-full flex-col items-stretch justify-center gap-8 md:flex-row">
          <div className="flex w-full max-w-80 flex-col justify-center items-center gap-6 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 text-center shadow-header">
            <div className="w-full max-w-64 rounded-full bg-linear-to-r from-rose via-love to-foam bg-size-[200%_200%] animate-shift p-1">
              <img
                src="headshot.jpg"
                alt="Profile"
                className="block aspect-square h-auto w-full rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              Computer Science and Physics @ Louisiana State University
            </div>

            <hr className="h-0.5 w-40 rounded-full border-0 bg-linear-to-r from-rose via-love to-foam bg-size-[200%_200%] animate-shift"></hr>

            <div className="flex flex-col items-center justify-center m-5">
              <a href="https://www.linkedin.com/in/quentinbordelon/" className="group flex flex-row justify-center items-center">
                <svg fill="currentColor" className="h-6 w-6 shrink-0 text-white transition-colors group-hover:text-rose" aria-hidden="true" 
                viewBox="0 0 455 455">
                  <g>
                    <path fillRule="evenodd" clipRule="evenodd" d="M246.4,204.35v-0.665c-0.136,0.223-0.324,0.446-0.442,0.665H246.4z"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M0,0v455h455V0H0z M141.522,378.002H74.016V174.906h67.506V378.002z
                      M107.769,147.186h-0.446C84.678,147.186,70,131.585,70,112.085c0-19.928,15.107-35.087,38.211-35.087
                      c23.109,0,37.31,15.159,37.752,35.087C145.963,131.585,131.32,147.186,107.769,147.186z M385,378.002h-67.524V269.345
                      c0-27.291-9.756-45.92-34.195-45.92c-18.664,0-29.755,12.543-34.641,24.693c-1.776,4.34-2.24,10.373-2.24,16.459v113.426h-67.537
                      c0,0,0.905-184.043,0-203.096H246.4v28.779c8.973-13.807,24.986-33.547,60.856-33.547c44.437,0,77.744,29.02,77.744,91.398V378.002
                      z"/>
                  </g>
                </svg>
                <p className="m-2">LinkedIn</p>
              </a>
              <a href="https://github.com/Implycitt" className="group m-2 flex flex-row justify-center items-center">
                <svg width="26" height="26" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transition-colors group-hover:text-rose">
                  <g clipPath="url(#clip0_730_27126)">
                    <path d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_730_27126">
                      <rect width="98" height="96" fill="currentColor"/>
                    </clipPath>
                  </defs>
                </svg>
                <p className="m-2">Github</p>
              </a>
              <a href="Resume.pdf" download="resume.pdf" className="group flex flex-row justify-center items-center m-2">Resume</a>
            </div>
          </div>
          <div className="grid w-full min-w-0 gap-8 rounded-2xl border-[1.5] border-solid border-rose bg-overlay p-5 shadow-header md:grid-cols-[minmax(0,1fr)_16rem] md:w-auto md:flex-1 md:pr-12 text-left">

            <div className="flex min-w-0 flex-col justify-center gap-4 text-center md:col-start-1 md:row-start-1">

              <div className="flex flex-wrap items-baseline gap-2 text-left">
                <p>I'm</p>
                <p className="text-love">Quentin</p>
              </div>
              <div className="mx-auto w-full max-w-[65ch] text-left space-y-5">
                <p>
                  a full stack developer. I specialize in low level, systems programming and data engineering. I am currently based in Baton Rouge, Louisiana.
                </p>

                <p>
                  Currently, I am the webmaster for GDG@LSU. At school, I work on a math research project involving video denoising.
                </p>
                <p>
                  Whenever I find time, I love to play games!
                </p>
              </div>

              <Steam/>
            </div>

            <ol className="relative flex h-full w-full flex-col md:col-start-2 md:row-start-1">
              <span className="absolute inset-y-0 right-[5px] w-0.5 bg-rose" />

              {timeline.map(([title, body]) => (
                <li key={title} className="flex flex-1 items-center gap-4">
                  <div className="ml-auto w-48 min-w-0 text-right">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="text-subtle">{body}</p>
                  </div>

                  <div className="relative w-3 shrink-0 self-stretch">
                    <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-full bg-rose ring-4 ring-overlay" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}
