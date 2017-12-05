export interface Profile {
    uid: string,
    displayName ? : string,
    coutry ? : {
        code: number,
        name: string
    },
    timezone ? : {
        offset: string,
        location: number
    },
    language ? : string,
    profile_url:string
}

export interface Problem {
    uid: string,
    title:string,
    type : string,
    descriptioin:string,
    favourite:boolean
}