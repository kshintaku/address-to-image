export const rejectPromise = (reason) => {
    return new Promise( (resolve, reject) => reject(reason) );
};
