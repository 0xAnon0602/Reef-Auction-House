import React, { useState } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { WsProvider } from "@polkadot/rpc-provider";
import { Contract } from "ethers";
import GreeterContract from "./contracts/Greeter.json";
import Uik from "@reef-defi/ui-kit";


const FactoryAbi = GreeterContract.abi;
const factoryContractAddress = GreeterContract.address;

const URL = "wss://rpc-testnet.reefscan.com/ws";

function App() {
	// const [msgVal, setMsgVal] = useState("");
	const [msg, setMsg] = useState("");
	const [auctionBool, setAuctionBool] = useState(false)
	const [msgPrize, setMsgPrize] = useState("");
	const [msgYourBid, setYourBid] = useState("0");
	const [msgHighestBid, setHighestBid] = useState("0");
	const [balance, setBalance] = useState("");
	const [isSameWallet, setIsSameWallet] = useState(false)


	const [value, setValue] = useState(0)
	const [prizevalue, setPrizevalue] = useState("Set Prize")

	const [signer, setSigner] = useState();
	const [isWalletConnected, setWalletConnected] = useState(false);



	const checkExtension = async () => {
		let allInjected = await web3Enable("Reef");

		if (allInjected.length === 0) {
			return false;
		}

		let injected;
		if (allInjected[0] && allInjected[0].signer) {
			injected = allInjected[0].signer;
		}

		const evmProvider = new Provider({
			provider: new WsProvider(URL),
		});

		evmProvider.api.on("ready", async () => {
			const allAccounts = await web3Accounts();

			allAccounts[0] &&
				allAccounts[0].address &&
				setWalletConnected(true);

			console.log(allAccounts);


			const wallet = new Signer(
				evmProvider,
				allAccounts[0].address,
				injected
			);

			// Claim default account
			if (!(await wallet.isClaimed())) {
				console.log(
					"No claimed EVM account found -> claimed default EVM account: ",
					await wallet.getAddress()
				);
				await wallet.claimDefaultAccount();
			}

			setSigner(wallet);


		});
	};

	const checkSigner = async () => {
		if (!signer) {
			await checkExtension();
		}
		return true;
	};

	const getAuctionStatus = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const result = await factoryContract.auctionStatus();
		if(!result){
			setMsg("Not Live")
			setAuctionBool(false)
		}
		else{
			setMsg("Live")
			setAuctionBool(true)
		}
	};


	const getAuctionPrize = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const result = await factoryContract.auctionPrize();
		setMsgPrize(result)
	};

	const getYourBid = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const result = await factoryContract.highestBidAddress();
		const evmAddress = await signer.queryEvmAddress()

		if(result.toLocaleLowerCase()===evmAddress.toLocaleLowerCase()){
			setIsSameWallet(true)
			const bid = await factoryContract.highestBid()
			setYourBid(parseInt(bid/10**18))
		}else{
			setYourBid("0")
			setIsSameWallet(false)
		}

	};


	const getHighestBid = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const result = await factoryContract.highestBid();
		setHighestBid(parseInt(result/10**18))
		if(result==0){setHighestBid("0")}

	};

	const getYourBalance = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const result = parseInt((await factoryContract.getYourBalance())/10**18)
		setBalance(result)
	};

	const bid = async () =>{
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const _toSend = String((value*balance)/100*10**18)
		await factoryContract.bid({value:_toSend })
		await updateFunction()
	}


	const endAuction = async () =>{
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		await factoryContract.endAuction()
		await updateFunction()
	}

	const startAuction = async () =>{
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		await factoryContract.startAuction(prizevalue)
		await updateFunction()
	}


	const updateFunction = async () =>{
		 getAuctionStatus()
		 getAuctionPrize()
		 getYourBid()
		 getHighestBid()
		 getYourBalance()
	} 


	return (
		<Uik.Container className="main">
			<Uik.Container vertical>

					<>
					{!isWalletConnected ? (
							<Uik.Container className="titleTop">
							<Uik.Button className="titleName"
							text="Connect Wallet"
							onClick={checkExtension }
						/>
						</Uik.Container>
						): <>

						<Uik.Container className="titleTop">
							<Uik.Button className="titleName"
							text="Update All Data"
							onClick={updateFunction}
						/>
						
						<Uik.Tag color="green" text="Your Balance"/>
						<Uik.ReefAmount value={balance} />
						</Uik.Container>
						<>
			
						  </>
						</>
						}		
						

						<Uik.Container className="firstCardTitle">
						
						<Uik.Card title='Auction Status' titlePosition="center" className="titleCard">

						{!isWalletConnected ? (
						<Uik.Loading className="loadButton" text='Connect Wallet ...'/>
						): <>

							<Uik.Container flow="spaceBetween">

  								<Uik.Tag color="green" 
									className="getButton"
									text={
										msg.length
											? msg
											: "Click on the update button"
									}
									type={msg.length ? "lead" : "light"}
								/>
						
							</Uik.Container>
						
						</>
						}

						</Uik.Card>

						<Uik.Card title='Bidding For' titlePosition="center" className="titleCard">
						{!isWalletConnected ? (
						<Uik.Loading className="loadButton" text='Connect Wallet ...'/>
						): <>

							<Uik.Container flow="spaceBetween">
			
  								<Uik.Tag color="green" 
									className="getButton"
									text={
										msgPrize.length
											? msgPrize
											: "Click on the update button"
									}
									type={msgPrize.length ? "lead" : "light"}
								/>
						
							</Uik.Container>
						
						</>
						}

						</Uik.Card>
						</Uik.Container>


						<Uik.Container className="secondCardTitle">
						
						<Uik.Card title='Your Bid' className="titleCard" titlePosition="center">
						{!isWalletConnected ? (
						<Uik.Loading className="loadButton" text='Connect Wallet ...'/>
						): <>

							<Uik.Container flow="spaceBetween">

									
			

								<Uik.ReefAmount className="getButton" 
								value={
									msgYourBid
								} 
								/>
														
							</Uik.Container>
						
						</>
						}		
						</Uik.Card>
						


						<Uik.Card title='Highest Bid' className="titleCard" titlePosition="center">
						{!isWalletConnected ? (
						<Uik.Loading className="loadButton" text='Connect Wallet ...'/>
						): <>

							<Uik.Container flow="spaceBetween">


								<Uik.ReefAmount className="getButton" 
								value={
									msgHighestBid
								} 
								/>
														
							</Uik.Container>
						
						</>
						}		
						</Uik.Card>
						</Uik.Container>

						<Uik.Container className="thirdCardTitle">

						<Uik.Card title='Set your Bid' className="titleCard" titlePosition="center"> 
						{!isWalletConnected ? (
						<Uik.Loading className="loadButton" text='Connect Wallet ...'/>
						): <>
						<br></br>

						{!isSameWallet ? (

						<Uik.Slider
						value={value}
						onChange={e => setValue(e)}

						tooltip={(value*balance)/100 }
						helpers={[
							{ position: 0, text: "0" },
							{ position: 100, text: `${balance}` },
						]}
						/>
						
						) : <> 
						
						</>
						}

							<Uik.Container flow="spaceBetween">
		
							{!isSameWallet ? (
								<Uik.Button
									className="getButton"
									onClick={bid}
									text="Bid"
							/>
							):<>
  							<Uik.Tag color="green" text="You already have the highest bid placed for this auction!"/>
							</>
						}
							

														
							</Uik.Container>
												
						</>
					}
						</Uik.Card>

						<br></br>

						<Uik.Card title='Change Auction Status' className="titleCard" titlePosition="center">
						{!isWalletConnected ? (
						<Uik.Loading className="loadButton" text='Connect Wallet ...'/>
						
						): <>
							{auctionBool ? (
							<Uik.Container flow="spaceBetween">
 						    <Uik.Button text='End Auction' className="getButton" danger
							onClick={endAuction}
							/>
    						</Uik.Container>
							):<>
						<Uik.Form>
						<Uik.Input
						// label='Set Price For Auction'
						value={prizevalue}
						onInput={e => setPrizevalue(e.target.value)}
						/>
						</Uik.Form>
						<br></br>
						<Uik.Button
						className="getButton"
						onClick={startAuction}
						text="Start Auction"
							/>
							</>
						}
						</>
						}
						</Uik.Card>
						</Uik.Container>						
						<Uik.Bubbles/>


					</>
				
			
			</Uik.Container>
		</Uik.Container>
	);
}

export default App;
