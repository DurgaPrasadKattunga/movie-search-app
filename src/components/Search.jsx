import React from 'react'

const Search = ({SearchTerm,setSearchTerm}) => {
    return (
        <div className="search">
            <div>
                <img src='/search.svg' alt="search"/>
                <input
                type = "text"
                placeholder = "Search for Movies"
                value = {SearchTerm}
                onChange = {(e) => setSearchTerm(e.target.value)}/>
            </div>
        </div>
    )
}
export default Search
