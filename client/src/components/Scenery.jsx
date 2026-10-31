// The hills sit behind every page, outside the app frame.
export default function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <img className="scenery-cloud" src="/cloud.webp" alt="" />
      <img className="scenery-hills" src="/hills.webp" alt="" />
    </div>
  )
}
