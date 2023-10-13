<script setup>
import { ref,onMounted,computed } from 'vue';

const allUrl = ref([])
const addUrl = ref("")
const shortUrl = ref("")
const generateShortUrl = ref("")
const qrCodeStore = ref("")
const generateUrlButton = ref(true)
const generateQrButton = ref(true)
const HistoryButton = ref(true)
const hideHistoryButton = ref(false)
const history = ref(false)

const showHistory  = ()=>{
  history.value=true
}
const hideHistory  = ()=>{
  history.value=false
}

const showViewHistoryButton = ()=>{
  HistoryButton.value=false
  hideHistoryButton.value=true
}
const hideHideHistoryButton  = ()=>{
  hideHistoryButton.value=false
  HistoryButton.value=true
}


const FetchURL = async () =>{
    try{
        const response = await fetch('https://generateurl-backend.onrender.com/api/shorturl');
        allUrl.value = await response.json();
    }
    catch (error) {
      console.log('error:', error)
     }
}

onMounted (async() => {
   await FetchURL()
})
 

const AddURL = async () =>{
    if(addUrl.value.startsWith('https:')||addUrl.value.startsWith('http:')){
    const response = await fetch('https://generateurl-backend.onrender.com/api/shorturl', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify({ origUrl: addUrl.value }),
        });
    const data = await response.json();
    shortUrl.value = data.shortUrl
    generateUrlButton.value = false
    generateQrButton.value = false
    generateShortUrl.value = data.shortUrl
      }
      else{
        alert("Invalid URL");
        addUrl.value=""
      }
}


const generateQrCode = async () => {
  try {
    const response = await fetch(`https://generateurl-backend.onrender.com/api/qrcode/${generateShortUrl.value}`, {
      method: 'GET',
    });

    if (response.ok) {
      const qrCode = await response.text();
      qrCodeStore.value = qrCode;
    } else {
      console.log('Failed to generate QR code. HTTP status:', response.status);
    }
  } catch (error) {
    console.error('Error while generating QR code:', error);
  }
};

</script>
 


<template>
  <div class="page-content pt-2">
    <div class="content w-1/2 p-6 mb-6 rounded-lg">
      <div class="input rounded-lg">
      <h2 class="text-2xl font-bold mb-4 text-center">Short URL</h2>
      <div class="mb-4">
        <div class="flex">
          <input
            type="text"
            class="border-2 flex-1 p-2 rounded-lg m-2"
            placeholder="Enter a URL"
            v-model="addUrl"
          />
          <button @click="AddURL(), FetchURL()" class="border-2 rounded-lg px-4 py-2 bg-blue-500 text-white m-2 hover:bg-blue-600" :disabled="!addUrl">
        Generate Short URL
      </button>
      <button @click="generateQrCode(), FetchURL()" class="border-2 rounded-lg px-4 py-2 bg-blue-500 text-white m-2 hover:bg-blue-600" :disabled="!addUrl">
        Generate QR Code
      </button>
        </div>
      </div>
      <div class="mid">
      <p v-if="shortUrl" class="mb-4">
          <span class="head">Short URL : </span>
          <a :href="'https://generateurl-backend.onrender.com/' + shortUrl" class="text-green-500">{{ shortUrl }}</a>
        </p>
        <div class="qr">
          <img v-if="qrCodeStore" :src="qrCodeStore" alt="QR Code" class="mb-2" />
        </div>
      <button v-if="HistoryButton" @click="FetchURL() ,showHistory() ,showViewHistoryButton()" class="border-2 rounded-lg p-2 bg-gray-200 px-4 py-2 mb-2 hover:bg-gray-300" :disabled="allUrl.length === 0">
        View History
      </button>
      <button  v-if="hideHistoryButton" @click="FetchURL() ,hideHistory() ,hideHideHistoryButton()" class="border-2 rounded-lg p-2 bg-gray-200 px-4 py-2 mb-2 hover:bg-gray-300">
        Hide History
      </button>
    </div>
  </div>
    
    <div v-if="history" class="mt-10">
      <div v-for="url in allUrl" :key="url.id" class="mb-4 border p-4 rounded-lg W-1/2">
        <p>
          <span class="head">Original URL : </span> {{ url.origUrl }}
        </p>
        <p>
          <span class="head">Short URL : </span>
          <a :href="'https://generateurl-backend.onrender.com/' + url.shortUrl" class="text-blue-500 hover:underline">{{ url.shortUrl }}</a>
        </p>
        <p>
          <span class="head">Clicks : </span>{{ url.clicks }}
        </p>
      </div>
    </div>
  </div>
  </div>
</template>


<style scoped>
/* .input{
  background-color: rgb(255, 255, 255);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
} */

.qr{
  display: flex;
  justify-content: center;
}
.mid{
  text-align: center;
  align-items: center;
}
.page-content{
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* text-align: center; */
  height: 100%;
}
button{
  transition: 0.3s;
}
.head{
  font-weight: bold;
}
</style>