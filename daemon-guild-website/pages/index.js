import Layout from "../components/Layout"

export default function Home() {
  var title = "Breakfast Guild"
  return (
    <>
      <Layout title={title}>
        <div className="layoutChildrenContainer">
          <div className="layoutChildrenContent">
            <p>Welcome.</p>
            <p>There is nothing to see here. Yet.</p>
          </div>
        </div>
      </Layout>        
    </>
  )
}
