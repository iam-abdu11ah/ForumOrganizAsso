import {useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import FormMsg from "./FormMsg";
import MsgList from "./MsgList";

function Forum({isPrivate}){

    // filtres de recherche lus depuis l'URL (remplis par SearchMsg)
    const [searchParams] = useSearchParams();

    // state modifier pour actualiser la liste
    const [updateList, setUpdateList] = useState(0);

    return (
    <div className='Forum'>
        <FormMsg
            isComment={false}
            msgAnswered={-1}
            isPrivate={isPrivate}
            setUpdateList={setUpdateList}
            updateList={updateList}
        />
        <MsgList
            isPrivate={isPrivate}
            msgSearchContent={searchParams.get("q")}
            dateBegin={searchParams.get("from")}
            dateEnd={searchParams.get("to")}
            setUpdateList={setUpdateList}
            updateList={updateList}
        />
    </div>);

}

export default Forum;
