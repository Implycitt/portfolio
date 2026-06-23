export default async function About() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#181616] px-6 py-24 overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#2EDFE5]/10 via-[#7b2cbf]/10 to-[#c77dff]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#2EDFE5] via-[#7b2cbf] to-[#c77dff] mb-12 drop-shadow-[0_0_20px_rgba(123,44,191,0.3)]">
          About me
        </h1>
        
        <div className="w-full backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative group">
          
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          
          <div className="space-y-6 font-mono text-white/80 text-sm md:text-base leading-relaxed relative z-10">
            <p>
              I am a Computer Science and Physics undergraduate student at Louisiana State University interested in the intersection of software engineering and physics.
            </p>
            
            <p>
              Beyond the classroom, I serve as the Webmaster for LSU's Google Developer Student Club, where I build internal platform tools, such as the club chapters website, and lead technical student workshops.
            </p>
            
            <p>
              I am currently working for the Department of Revenue in Illinois and FAST Enterprises as a software engineering intern.
            </p>
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
}