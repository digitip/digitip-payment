// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRwx5ocoYwGdWPMX9NxoI4QwrCNosGoQM",
    authDomain: "digitip-c9a79.firebaseapp.com",
    projectId: "digitip-c9a79",
    storageBucket: "digitip-c9a79.appspot.com",
    messagingSenderId: "437961437032",
    appId: "1:437961437032:android:43cd5af1d796ab21e830dd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchHotelUpi(hotelName) {
    const hotelsRef = collection(db, "hotels");
    const q = query(hotelsRef, where("hotelName", "==", hotelName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Hotel not found");
    }

    const hotel = querySnapshot.docs[0].data();
    return hotel.hotelUpi;
}

async function fetchWorkerUpi(hotelName, workerId) {
    const workersRef = collection(db, "workers");
    const q = query(workersRef, where("hotelName", "==", hotelName), where("workerID", "==", workerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Worker not found");
    }

    const worker = querySnapshot.docs[0].data();
    return worker.workerUpi;
}

async function handlePayment() {
    const billAmount = parseFloat(document.getElementById("billAmount").value);
    const tipAmount = parseFloat(document.getElementById("tipAmount").value);
    const workerId = parseInt(document.getElementById("workerId").value);

    const urlParams = new URLSearchParams(window.location.search);
    const hotelName = urlParams.get("hotelName");

    if (!billAmount || isNaN(billAmount) || !tipAmount || isNaN(tipAmount) || !workerId || isNaN(workerId) || !hotelName) {
        alert("Please fill all fields correctly.");
        return;
    }

    try {
        const hotelUpi = await fetchHotelUpi(hotelName);
        const workerUpi = await fetchWorkerUpi(hotelName, workerId);

        const totalAmount = billAmount + tipAmount;

        const options = {
            key: "rzp_test_GgM2kAdukcdZZV",
            amount: totalAmount * 100,
            currency: "INR",
            name: "Digitip Payment",
            description: `Payment for Hotel ${hotelName}`,
            handler: async function (response) {
                alert(`Payment successful! Razorpay ID: ${response.razorpay_payment_id}`);
                await splitPayment(hotelUpi, workerUpi, billAmount, tipAmount);
            },
            prefill: {
                name: "Customer",
                email: "customer@example.com",
                contact: "9999999999",
            },
            theme: {
                color: "#3399cc",
            },
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function splitPayment(hotelUpi, workerUpi, billAmount, tipAmount) {
    alert(`Splitting payment:
        Hotel UPI: ${hotelUpi} - ₹${billAmount}
        Worker UPI: ${workerUpi} - ₹${tipAmount}`);
}

document.getElementById("proceedToPay").addEventListener("click", handlePayment);
