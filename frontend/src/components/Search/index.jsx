import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import IconButton from '@mui/material/IconButton';
import { IoSearch } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/productListing?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    const handleClear = () => {
        setSearchTerm('');
    };

    return (
        <div className={`search-container w-full sticky ${isFocused ? 'focused' : ''}`}>
            <form onSubmit={handleSearch} className="w-full h-full flex">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search for products..." 
                        className="w-full !h-[44px] md:h-[44px] bg-gray-100 rounded-l-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        aria-label="Search"
                        
                    />
                    {searchTerm && (
                        <IconButton 
                            aria-label="Clear search"
                            onClick={handleClear}
                            className="!absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 p-0 m-0 z-10"
                            size="small"
                        >
                            <IoClose />
                        </IconButton>
                    )}
                </div>
                <button 
                    type="submit"
                    className="search-button bg-blue-600 hover:bg-blue-700 text-white min-w-[44px] h-[44px] rounded-r-md flex items-center justify-center transition-colors"
                    aria-label="Search"
                >
                    <IoSearch className="text-xl" />
                </button>
            </form>
        </div>
    );
};

export default Search;