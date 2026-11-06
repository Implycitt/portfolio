import Header from '@/lib/components/Header'

export default function Home() {
  return (
  <main className="flex-1">
    <div className="flex flex-col p-6 m-9">
      <Header/>
      <div className="flex text-center items-center m-8 justify-center text-6xl">
        Quentin Bordelon
      </div>

      <div className="flex flex-row">
        <div className="flex flex-col border-3 border-solid border-indigo-500 rounded-sm m-8 p-5 w-[20vw] h-[70vh] justify-center items-center gap-6 text-center">
          <div className="flex flex-col items-center justify-center">
            This is where we're going to put my stuff
          </div>
          <div className="flex flex-col items-center justify-center m-5 p-5">
            <div>LinkedIn</div>
            <div>Github</div>
          </div>
        </div>
        <div className="border-2 border-solid border-indigo-300 rounded-sm justify-center items-center m-8 p-5 w-[70vw] h-[70vh]">
          Main container
        </div>
      </div>

    </div>
  </main>
  )
}
