import React from "react";



const Index: React.FC = () => {
    return <></>;
};

export async function getServerSideProps(context: any) {

  const params = context.query 
  let queryString = "?" + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  
  (queryString === "?") ? queryString = "?utm_content=battleground2k" : null;

    return {
      redirect: {
        destination: `/events/1` + queryString,
        permanent: false,
      },
    }
}

export default Index;