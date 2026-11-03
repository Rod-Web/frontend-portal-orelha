let url = "";

const ambiente = "dev";


if (ambiente === "dev"){
    url = "http://localhost:3000"
} else {
    url = "https://backend-portal-orelha.onrender.com";
}

export default url