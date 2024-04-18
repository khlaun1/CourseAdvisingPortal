import React from 'react';

function Clickjack() {
  return (
    <div>
      <h1>Testing Clickjacking Protection</h1>
      <iframe src="http://localhost:3001/Login" style={{ width: '500px', height: '500px' }} title="Test Frame"></iframe>
    </div>
  );
}

export default Clickjack;
