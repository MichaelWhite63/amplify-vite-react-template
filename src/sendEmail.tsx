import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

import { Amplify } from "aws-amplify"
import outputs from "../amplify_outputs.json"

Amplify.configure(outputs);

const client = generateClient<Schema>();

const SendEmail: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'Steel' | 'Auto' | 'Aluminum'>('Steel');

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedType(event.target.value as 'Steel' | 'Auto' | 'Aluminum');
    console.log(   client.queries.sendEmail({name: 'World', type:  event.target.value as 'Steel' | 'Auto' | 'Aluminum'}));
  }

  return (
    <div>
      <h1>Send Email</h1>
      <label htmlFor="type">Select Type:</label>
      <select id="type" value={selectedType} onChange={handleChange}>
        <option value="Steel">Steel</option>
        <option value="Auto">Auto</option>
        <option value="Aluminum">Aluminum</option>
      </select>
      <p>Selected Type: {selectedType}</p>
    </div>
  );
};

export default SendEmail;