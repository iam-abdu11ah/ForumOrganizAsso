import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// les filtres de recherche sont stockés dans l'URL : /?q=...&from=...&to=...
function SearchMsg(){

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    // States contenant les valeurs des champs du formulaire, initialisés depuis l'URL
    const [content, setContent] = useState(searchParams.get("q") || "");
    const [dateBegin, setDateBegin] = useState(searchParams.get("from") || "");
    const [dateEnd, setDateEnd] = useState(searchParams.get("to") || "");


    // fonction executé une fois le bouton rechercher appuyer, actualise les filtre
    const handleSetFilter = (event) => {
        event.preventDefault();

        const params = new URLSearchParams();
        if (content) params.set("q", content);
        if (dateBegin) params.set("from", dateBegin);
        if (dateEnd) params.set("to", dateEnd);

        // on reste dans le forum privé si on y est, sinon on recherche dans le forum public
        const pathname = location.pathname === "/private" ? "/private" : "/";
        navigate({ pathname, search: params.toString() });
    }

    return (
    <div className="searchZone">
        <form className="searchBar" onSubmit={handleSetFilter}>
            <input id='content' className="searchInput" type='text' placeholder="Rechercher..." value={content} onChange={(e) => {setContent(e.target.value)}}/>
            <input type="date" id='dateBegin' title="Date plus ancienne" value={dateBegin} onChange={(e) => {setDateBegin(e.target.value)}}/>
            <input type="date" id='dateEnd' title="Date plus récente" value={dateEnd} onChange={(e) => {setDateEnd(e.target.value)}}/>
            <button type="submit">🔍</button>
        </form>
    </div>
    )

}

export default SearchMsg;
