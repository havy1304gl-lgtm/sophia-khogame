import {createContext} from 'react';
import type {QuestionSelection,QuestionProgress,QuestionPlan} from '../lib/question-progress';
type Value={selections:Record<string,QuestionSelection>;updateSelection:(quizId:string,fn:(value:QuestionSelection)=>QuestionSelection)=>void;progress:QuestionProgress;ready:boolean;error:string;classId:string;mark:(plan:QuestionPlan,id:string)=>void;reset:(quizId:string)=>void;undo:(quizId:string)=>void};
export const QuestionProgressContext=createContext<Value>(null!);
