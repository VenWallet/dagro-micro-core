const axios = require('axios');

async function useQuery( data: { 
	query: any,
	variables?: any
}) {
  const GRAPHQL_ENDPOINT =  process.env.GRAPH_P2P!;
  
  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, {
      query: data.query,
      variables: data?.variables
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error en la consulta GraphQL:', error);
    throw error;
  }
}

export { useQuery };
