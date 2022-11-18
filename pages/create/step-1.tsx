import React from "react";



const Index: React.FC = () => {
    return <></>;
};

export async function getServerSideProps(context: any) {

  const params = context.query 
  let queryString = "?" + Object.keys(params).map(key => key + '=' + params[key]).join('&');

    return {
      redirect: {
        destination: `/create` + queryString,
        permanent: false,
      },
    }
}

export default Index;