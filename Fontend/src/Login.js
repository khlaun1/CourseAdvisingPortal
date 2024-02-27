import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

/*What is React? 
React is the default export object from the react library which lets us
create elements components etc.

What is useState?
use state is a react hook which is basically a function which let's 
us add the React state to the functional components. When we use this hook
it returns an array containing two elements
1. the current state value
2. a function to update this value.

What is React state? 
React state is basically an object which holds some information which may
change over the life cycle of the component. For instance a state variable 
might keep track of whether the button is clicked or not i.e. storing the 
information about the button being clicked.
*/



function Login(){
    const [email, emailUpdate] = useState('');
    const [password, passUpdate] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();



    const submitHandler = async (eventObj) =>{
        eventObj.preventDefault();
        //fetching the valid email endpoint
        const validEmailResponse = await fetch('http://localhost:3000/valid-email', {
            method : "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({email, password})
        })


        //const responseData = validEmailResponse.json();
        //const responsetext = validEmailResponse.text();

        if(!validEmailResponse.ok){
            if(validEmailResponse.status===409){
                alert('invalid email entered! Please enter a valid email');
            }
            return;
        } 
        else{

            //alert(responseData.message);
            setMessage('valid email please try logging in again after some time.')
            
        }

    };

    return(
<div className="flex items-center justify-center h-screen bg-slate-500">
    <div className="p-8 bg-white rounded-lg shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login</h2>
        <form onSubmit={submitHandler} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="email">Email</label>
                <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
                    <span className="pl-3">
                        <i className="fas fa-envelope text-gray-500"></i>
                    </span>
                    <input
                        className="w-full px-4 py-3 focus:outline-none transition duration-200"
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => emailUpdate(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="password">Password</label>
                <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
                    <span className="pl-3">
                        <i className="fas fa-lock text-gray-500"></i>
                    </span>
                    <input
                        className="w-full px-4 py-3 focus:outline-none transition duration-200"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => passUpdate(e.target.value)}
                    />
                </div>
            </div>
            <button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
                type="submit"
            >
                Login
            </button>
            
            {message && <div className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{message.text}</div>}
        </form>
    </div>
</div>

    );
}


export default Login;

