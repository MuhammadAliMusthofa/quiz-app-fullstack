const loginValidation = (data, setDelay) => {
  setDelay(true);
  const datas = fetch("https://mymushroom.my.id/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((datas) => {
      return datas;
    })
    .catch((error) => {
      console.error("Error fetching mushrooms:", error);
    })
    .finally(() => {
      setDelay(false);
    });
  return datas;
};

export { loginValidation };
