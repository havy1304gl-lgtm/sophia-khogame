import {useEffect,useSyncExternalStore} from 'react';
import {getCloudLibrary,subscribeCloudLibrary,startCloudLibrary} from '../lib/cloud-library';
import {cloudEnabled} from '../lib/firebase';
const empty={user:null,quizzes:[],folders:[],members:[],grants:[],loading:false,error:''},noop=()=>()=>{},getEmpty=()=>empty;
export function useQuestionBanks(){const value=useSyncExternalStore(cloudEnabled?subscribeCloudLibrary:noop,cloudEnabled?getCloudLibrary:getEmpty,cloudEnabled?getCloudLibrary:getEmpty);useEffect(()=>{if(cloudEnabled)startCloudLibrary();},[]);return value;}
