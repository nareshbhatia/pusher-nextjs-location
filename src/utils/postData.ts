export async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    // enables cookies to be included in the response
    // credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}
