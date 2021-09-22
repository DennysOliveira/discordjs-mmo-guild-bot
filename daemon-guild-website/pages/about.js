import Layout from "../components/Layout"

export default function About() {
  var title = "About - Breakfast Guild"

  return (
    <>
      <Layout title={title}>
        <div className="layoutChildrenContainer">
          <div className="layoutChildrenContent">
            <p>There is also nothing to see here.</p>
          </div>
        </div>
      </Layout>       
    </>
  )
}
