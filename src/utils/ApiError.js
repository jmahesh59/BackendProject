class ApiError extends Error{
    constructor(
        statusCode,
        massage="Something went wrong",
        errors=[],
        statck =""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message=this.message
        this.success=false
        this.errors =errors

        if(stack){
            this.statck =statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}