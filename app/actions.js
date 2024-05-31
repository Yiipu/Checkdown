"use server";

export async function predict(formdata) {
  return fetch(`${process.env.API_URL}/predict`, {
    method: "POST",
    body: formdata,
  })
    .then((response) => response.json())
    .then((data) => {
      return {message : `${data.predict}`};
    })
    .catch((error) => {
      return {error : `${error}`};
    });
}
