import 'react-notion-x/src/styles.css'
import * as React from 'react'
import { NotionAPI } from 'notion-client'


import { NotionRenderer } from 'react-notion-x'


interface Props { recordMap: any }

const Blog: React.FC<Props> = ({ recordMap }) => {
    return (

        <NotionRenderer recordMap={recordMap} fullPage={true} darkMode={true} disableHeader={true} />
    )
}

export const getStaticProps = async (context: any) => {

    const notion = new NotionAPI()
    const recordMap = await notion.getPage('bfc8a3852f4f4284a59290021086834b')

    return {
        props: {
            recordMap
        },
        revalidate: 10
    }
}

export default Blog;
