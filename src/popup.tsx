import { metadata } from "./content"
import "./style.css"

function IndexPopup() {
  return (
    <main className="w-[720px] h-[560px] bg-gray-100 p-4">
      <h1 className="text-4xl">wtop</h1>
      <br />
      <button
        className="bg-yellow-500 text-white p-3"
        onClick={() => { console.log({ metadata }) }}
      >
        Show Data
      </button>
    </main>
  )
}

export default IndexPopup
