import React, { useState } from 'react';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';

const MyComponent = () => {
    const [selectedItems, setSelectedItems] = useState([]);

    const handleChange = (selected) => {
        setSelectedItems(selected);
    };

    return (
        <div>
            <h1>Dual Listbox Example</h1>
            <DualListBox
                options={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
                selected={selectedItems}
                onChange={handleChange}
            />
            <h2>Selected Items:</h2>
            <ul>
                {selectedItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default MyComponent;
