import { NextApiRequest } from "next";
import React from "react";



const Index: React.FC = () => {
    return <></>;
};

export async function getServerSideProps(context: any) {
  

    const params = context.query 
    let queryString = "?" + Object.keys(params).map(key => key + '=' + params[key]).join('&');
    
    (queryString === "?") ? queryString = "" : null;

    return {
      redirect: {
        destination: `/auction/1` + queryString,
        permanent: false,
      },
    }
}

export default Index;