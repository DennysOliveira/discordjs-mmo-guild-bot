import Layout from "../components/Layout"
import Link from "next/link"

export default function About() {
  var title = "Join - Breakfast Guild"

  return (
    <>
      <Layout title={title}>
        <div className="layoutChildrenContainer">
          <div className="layoutChildrenContent">
            <p>If you're a member already, use our bot commands on discord for registering.</p>
            <p>At least I'll give you our Discord link:</p>
           
              <a href="https://discord.gg/gkVyuctr6q">
                https://discord.gg/gkVyuctr6q
              </a>
            
          </div>
        </div>
      </Layout>      
    </>
  )
}
