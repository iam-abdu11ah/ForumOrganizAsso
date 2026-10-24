import { useEffect, useState } from "react";
import "../css/ServerWaking.css";

// spinner affiché pendant une requête ; après 3 s, explique que le serveur démarre et affiche le temps écoulé
// (le backend gratuit sur Render s'endort après 15 min d'inactivité et met ~50 s à se réveiller)
export default function ServerWaking({ compact = false }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={"serverWaking" + (compact ? " compact" : "")} role="status">
            <div className="spinner" />
            {seconds >= 3 && <>
                <p className="serverWakingTitle">Starting the server… {seconds}s</p>
                <p>The server goes to sleep when nobody uses it for a while.
                   Waking it up takes about a minute, and you don't need to do anything.</p>
            </>}
        </div>
    );
}
