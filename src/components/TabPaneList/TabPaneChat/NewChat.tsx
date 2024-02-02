import React, {useContext, useState} from 'react';
import styled from "styled-components";
import HeaderSection from "../../HeaderSection";
import FormInputSearch from "../../FormInputSearch";
import ContactItem from "../../ContactItem";
import {ChatTypeEnum, ScreenChatEnum} from "../../../constants/chat";
import {ScreenChatType} from "../../../types/chat.type";
import {Filter, Timestamp, PublicKey, Keys, Event} from "@rust-nostr/nostr-sdk";
import {userProviderContext} from "../../../providers/UserProvider";

interface PropsTypeNewChat {
    goTo: (screen: ScreenChatType) => void;
}

const NewChat = ({goTo}: PropsTypeNewChat) => {
    const [term, setTerm] = useState<string>('')
    const onChange = (valueSearch: string) => {
        setTerm(valueSearch)
    }
    const {client, keys} = useContext(userProviderContext)
    const [newContact, setNewContact] = useState('');
    const handleNewContact = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        let subscriptionKey = PublicKey.fromHex(newContact)
        console.log('PublicKey new subscription', subscriptionKey)

        if (newContact) {
            let subscription = new Filter()
                .author(subscriptionKey)
                .kind(0)
                .since(Timestamp.now());

            if (client && keys) {
                await client.subscribe([subscription])

                const filter = new Filter().kinds(new Float64Array([3])).until(Timestamp.now()).limit(10);

                let events = await client.getEventsOf([filter], 10);
                console.log('events:', events.map((event) => {
                    const eventJson = JSON.parse(event.asJson())

                    return {
                        kind: eventJson.kind,
                        id: eventJson.id,
                        data: {
                            message: eventJson.content,
                            createdAt: eventJson.created_at
                        }
                    }
                }))

                /*                const handle = {
                                    // Handle event
                                    handleEvent: async (relayUrl, event) => {
                                        console.log("Received new event from", relayUrl, event);

                                    },
                                    // Handle relay message
                                    handleMsg: async (relayUrl, message) => {
                                        console.log("Received message from", relayUrl, message.asJson());
                                    }
                                };

                                client.handleNotifications(handle)*/

            }
        }

    }

    return (
        <NewChatBox>
            <HeaderSection title={'New chat'} back={true} goBack={() => goTo(ScreenChatEnum.DEFAULT)}/>
            <BoxSearch>
                <FormInputSearch placeholder={'Search...'} id={'newChat'} name={'newChat'} value={term}
                                 onChange={onChange}/>
            </BoxSearch>
            <BoxAddGroup>
                <ContactItem type={ChatTypeEnum.GROUP} goTo={() => goTo(ScreenChatEnum.NEW_GROUP)}/>
            </BoxAddGroup>
            <BoxContactUser>
                <TextContact>Contacts</TextContact>
                <ListUser>
                    <ContactItem type={ChatTypeEnum.USER}/>
                </ListUser>
            </BoxContactUser>
            <div>
                <form onSubmit={handleNewContact}>
                    <input placeholder={'new contact public key'} value={newContact}
                           onChange={(e) => setNewContact(e.target.value)}/>
                    <button type={"submit"}>New contact</button>
                </form>
            </div>
        </NewChatBox>
    );
};
const NewChatBox = styled.div`
    height: 100%;
`
const BoxSearch = styled.div`
    padding: 0 16px;
    margin-bottom: 16px;
`
const BoxAddGroup = styled.div``
const BoxContactUser = styled.div``
const ListUser = styled.div``
const TextContact = styled.h6`
    ${({theme}) => theme.font1420};
    letter-spacing: 0.1px;
    color: ${({theme}) => theme.secondaryEleLight};
    padding: 16px;
    margin: 0;
`
export default NewChat;
