
function formatPageNumber(input){
    if(!input || typeof input !== "string") return null;

    // Normalize separators to comma
    const normalized = input
        .replace(/\s+/g, ",")   // spaces → commas
        .replace(/-+/g, "-")    // multiple dashes → single dash
        .replace(/,+/g, ",")    // multiple commas → single comma
        .replace(/^,|,$/g, ""); // trim commas

    const pages = new Set();

    normalized.split(",").forEach((part) => {
        if(part.includes("-")){
            let [start, end] = part.split("-").map(Number);
            if(!start || !end) return;

            // Auto-fix reverse ranges like "5-2"
            if(start > end) [start, end] = [end, start];

            for(let i = start; i <= end; i++){
                pages.add(i);
            }
        } 
        else{
            const num = Number(part);
            if(num) pages.add(num);
        }
    })

    return [...pages].sort((a, b) => a - b);
}

module.exports = formatPageNumber;
