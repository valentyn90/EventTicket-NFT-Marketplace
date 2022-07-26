import 'react-notion-x/src/styles.css'
import * as React from 'react'
import { NotionAPI } from 'notion-client'


import { NotionRenderer } from 'react-notion-x'


interface Props { recordMap: any }

const Terms: React.FC<Props> = ({ recordMap }) => {
    return (

        <NotionRenderer recordMap={recordMap} fullPage={true} darkMode={true} disableHeader={true} />
    )
}

export const getStaticProps = async (context: any) => {

    const notion = new NotionAPI()
    const recordMap = await notion.getPage('ff1b183b55f245179cc54f6a59c6d2a6')

    return {
        props: {
            recordMap
        },
        revalidate: 10
    }
}

export default Terms;
