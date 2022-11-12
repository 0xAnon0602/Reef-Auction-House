
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