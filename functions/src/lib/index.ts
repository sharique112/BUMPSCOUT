
import * as admin from 'firebase-admin'

export const validateFireTokenId = (req: any , res: any, next: any) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !req.cookies.__session) {
    res.status(403).json({
      error: 'Unauthorized Access Token',
      code: 403
    });
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    idToken = req.cookies.__session;
  }
  admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
    req.user = decodedIdToken;
    next();
  }).catch(error => {
    res.status(403).json({
      error: 'Unauthorized Access Token',
      code: 403
    });
  });
}