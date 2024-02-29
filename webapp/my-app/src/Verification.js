import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useParams} from 'react-router-dom';

function Verification(){

    const [verifyer, verifyerUpdate] = useState('');
    const {emailToGo} = useParams();
    const {adminVal} = useParams();
    console.log('This is the email which is being passed to the const through params', adminVal)
    
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const submitHandler = async (eventObj)=>{
        eventObj.preventDefault();




        const verificationResponse = await fetch('http://localhost:3000/email-verification', {
            method : "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({verifyer, emailToGo})
        })

        const resData = await verificationResponse.json();

        console.log('this is my resData ', resData);
        if(resData.verified){
            navigate(`/profile/${emailToGo}/${adminVal}/`);
        }
        else if(!resData.verified){
            navigate('/login');
        }

    };

    



    return(
        <div className="flex items-center justify-center h-screen bg-sky-700">
            <div className="p-8 bg-white rounded-lg shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login Verification</h2>
            <form onSubmit={submitHandler} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-2" htmlFor="Verifyer">Token Verification</label>
                    <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
                    <span className="pl-3">
                        <i className="fas fa-envelope text-gray-500"></i>
                    </span>
                    <input
                        className="w-full px-4 py-3 focus:outline-none transition duration-200"
                        id="token"
                        type="token"
                        placeholder="Verification Token"
                        value={verifyer}
                        onChange={(e) => verifyerUpdate(e.target.value)}
                    />
                    </div>
                </div>
                <button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
                type="submit"
                >
                Verify
                </button>
            </form>

            </div>
        </div>
    );
}



export default Verification;