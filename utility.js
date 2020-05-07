class Logger
{
    constructor()
    {
        this.start = (new Date()).toISOString()
    }

    log(msg)
    {
        var differ = (new Date()).toISOString - this.start;
        console.log(msg + "| " + differ)
    }
}