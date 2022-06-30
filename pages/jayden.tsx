import React from "react";



const Index: React.FC = () => {
    return <></>;
};

export async function getServerSideProps(context: any) {

    let queryString = "?utm_source=athlete&utm_medium=redirect&utm_name=bonsu&utm_content=jaydenurl"

    return {
      redirect: {
        destination: `/auction/1` + queryString,
        permanent: false,
      },
    }
}

export default Index;