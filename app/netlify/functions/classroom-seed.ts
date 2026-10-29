import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {getSophiaAdminApp} from '../../server/firebase-admin';
import {handleClassroomSeed} from '../../server/classroom-seed-handler';
import {sessionRole} from '../../lib/access-policy';
import type {ClassroomSeed} from '../../lib/classroom-seed';
export default async function(request:Request){
 return handleClassroomSeed(request,{
  authorize:async token=>{const app=getSophiaAdminApp(),claims=await getAuth(app).verifyIdToken(token,true),role=sessionRole(claims);if(!role||claims.sophiaAccessVersion!==(process.env.SOPHIA_ACCESS_VERSION??'v1'))return null;const control=await getFirestore(app).doc('_access/control').get();return control.data()?.version===claims.sophiaAccessVersion?role:null;},
  load:async()=>{const doc=await getFirestore(getSophiaAdminApp()).doc('_student_picker/default_classes').get();return doc.exists?doc.data() as ClassroomSeed:null;},
  save:async seed=>{await getFirestore(getSophiaAdminApp()).doc('_student_picker/default_classes').set(seed);}
 });
}
