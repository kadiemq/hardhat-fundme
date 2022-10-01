import { run } from "hardhat";

export default async function verify(contractAddress: string, args: any) {
    console.log(`Verifiying contract ${contractAddress}`);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Alerdy Verified");
        } else {
            console.log(e);
        }
    }
}
