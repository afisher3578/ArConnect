import {
  Text,
  ButtonV2,
  InputV2,
  Loading,
  ModalV2,
  SelectV2,
  Spacer,
  TooltipV2,
  useModal,
  useToasts,
  type DisplayTheme
} from "@arconnect/components";
import { useState, useEffect, type MouseEventHandler, useMemo } from "react";
import { Edit02, Share04, Upload01 } from "@untitled-ui/icons-react";
import { uploadUserAvatar, getUserAvatar } from "~lib/avatar";
import { CheckIcon, CopyIcon } from "@iconicicons/react";
import { EventType, trackEvent } from "~utils/analytics";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import browser from "webextension-polyfill";
// import { getAllArNSNames } from "~lib/arns";
import { useTheme } from "~utils/theme";
import styled from "styled-components";
import { svgie } from "~utils/svgies";
import { useLocation } from "wouter";
import copy from "copy-to-clipboard";
// import { isAddressFormat } from "~utils/format";

export default function ContactSettings({ address }: Props) {
  // contacts
  const [storedContacts, setStoredContacts] = useStorage(
    {
      key: "contacts",
      instance: ExtensionStorage
    },
    []
  );

  const { setToast } = useToasts();
  const theme = useTheme();

  const [editable, setEditable] = useState(false);
  const [contact, setContact] = useState({
    name: "",
    address: "",
    profileIcon: "",
    notes: "",
    ArNSAddress: "",
    avatarId: ""
  });
  const [contactIndex, setContactIndex] = useState(-1);
  // const [arnsResults, setArnsResults] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [originalContact, setOriginalContact] = useState(null);
  const [loading, setLoading] = useState(false);

  const svgieAvatar = useMemo(() => {
    if (!contact.address || contact.avatarId) {
      return "";
    }
    return svgie(contact.address, { asDataURI: true });
  }, [contact.address, contact.avatarId]);

  useEffect(() => {
    const loadedContact = storedContacts.find((c) => c.address === address);
    if (loadedContact) {
      setContact(loadedContact);
      setContactIndex(storedContacts.indexOf(loadedContact));
      // if (loadedContact.address && isAddressFormat(loadedContact.address)) {
      //   fetchArnsAddresses(loadedContact.address);
      // }
    } else {
      setContact({
        name: "",
        address: "",
        profileIcon: "",
        notes: "",
        ArNSAddress: "",
        avatarId: ""
      });
      setContactIndex(-1);
    }
  }, [storedContacts, address]);

  // TODO: Uncomment when getAllArNSNames is optimized
  // async function fetchArnsAddresses(ownerAddress) {
  //   try {
  //     setLoading(true);
  //     const arnsNames = await getAllArNSNames(ownerAddress);
  //     setArnsResults(arnsNames || []);
  //   } catch (error) {
  //     console.error("Error fetching ArNS addresses:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContact({
      ...contact,
      [name]: value
    });
  };

  const saveContact = async () => {
    // check if the address has been changed to a different one that's already in use
    const addressChanged =
      contact.address !== storedContacts[contactIndex].address;
    const addressUsedByAnotherContact = storedContacts.some(
      (existingContact, index) =>
        existingContact.address === contact.address && index !== contactIndex
    );

    if (addressChanged && addressUsedByAnotherContact) {
      setToast({
        type: "error",
        content: browser.i18n.getMessage("address_in_use"),
        duration: 3000
      });
      setContact({
        ...contact,
        address: storedContacts[contactIndex].address
      });
      return;
    }

    if (contactIndex !== -1) {
      const updatedContacts = [...storedContacts];
      updatedContacts[contactIndex] = contact;
      try {
        await ExtensionStorage.set("contacts", updatedContacts);
      } catch (error) {
        console.error("Error updating contacts:", error);
      }
    }

    setEditable(false);
  };

  // generate profile icon from the first name
  const generateProfileIcon = (name, address) => {
    if (name && name.length > 0) {
      return name[0].toUpperCase();
    } else if (address && address.length > 0) {
      return address[0].toUpperCase();
    }
    return "";
  };

  const handleAvatarUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        const avatarTxId = await uploadUserAvatar(selectedFile);
        setToast({
          type: "success",
          content: browser.i18n.getMessage("uploaded_avatar"),
          duration: 5000,
          action: {
            name: browser.i18n.getMessage("copyId"),
            task: () => copy(avatarTxId)
          }
        });
        setContact({
          ...contact,
          avatarId: avatarTxId
        });
      } catch (error) {
        setToast({
          type: "error",
          content: `File size too large. ${error}`,
          duration: 5000
        });
        console.error("Error uploading avatar:", error);
      }
    }
  };

  useEffect(() => {
    if (contact.avatarId) {
      setAvatarLoading(true);
      getUserAvatar(contact.avatarId)
        .then((imageUrl) => {
          setContact({
            ...contact,
            profileIcon: imageUrl
          });
          setAvatarLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching avatar:", error);
          setAvatarLoading(false);
        });
    }
  }, [contact.avatarId]);

  const renderArNSAddress = () => {
    if (editable) {
      return (
        <>
          {/* <SubTitle>{browser.i18n.getMessage("ArNS_address")}</SubTitle>
          <InputWrapper>
            <SelectInput
              fullWidth
              small
              name="ArNSAddress"
              value={contact.ArNSAddress}
              onChange={(e) =>
                setContact({ ...contact, ArNSAddress: e.target.value })
              }
            >
              <option value="">
                {loading
                  ? browser.i18n.getMessage("searching_ArNS_addresses")
                  : arnsResults.length === 0 && !contact.ArNSAddress
                  ? browser.i18n.getMessage("no_ArNS_address_found")
                  : browser.i18n.getMessage("select_ArNS_address")}
              </option>
              {arnsResults.map((arnsName) => (
                <option key={arnsName} value={arnsName}>
                  {browser.i18n.getMessage("arweave_url") + arnsName}
                </option>
              ))}
            </SelectInput>
          </InputWrapper> */}
        </>
      );
    } else if (contact.ArNSAddress) {
      return (
        <>
          <SubTitle>{browser.i18n.getMessage("ArNS_address")}</SubTitle>
          <ContactInfo>
            {browser.i18n.getMessage("arweave_url") + contact.ArNSAddress}
            <Link
              onClick={() =>
                browser.tabs.create({
                  url: `https://${contact.ArNSAddress}.arweave.ar`
                })
              }
            />
          </ContactInfo>
        </>
      );
    }
  };

  const [, setLocation] = useLocation();

  const removeContactModal = useModal();

  const confirmRemoveContact = async () => {
    trackEvent(EventType.REMOVE_CONTACT, {});
    // remove contact & update storage
    if (contactIndex !== -1) {
      const updatedContacts = [...storedContacts];
      updatedContacts.splice(contactIndex, 1);
      try {
        await ExtensionStorage.set("contacts", updatedContacts);
      } catch (error) {
        console.error("Error removing contact:", error);
      }
    }

    removeContactModal.setOpen(false);
    setLocation("/contacts");
  };

  const copyAddress: MouseEventHandler = (e) => {
    e.stopPropagation();
    copy(contact.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const toggleEdit = () => {
    if (!editable) {
      // entering edit mode, store the current contact data
      setOriginalContact(contact);
    } else {
      // check for unsaved changes
      if (originalContact) {
        // reset contact state
        setContact(originalContact);
      }
    }
    setEditable(!editable);
  };

  const areFieldsEmpty = () => {
    return !contact.address;
  };

  return (
    <Wrapper>
      <div>
        <div>
          <Spacer y={0.45} />
          <Header>
            <Title>{browser.i18n.getMessage("contact_info")}</Title>
            <EditIcon onClick={toggleEdit} />
          </Header>
        </div>
        <SubTitle>{browser.i18n.getMessage("contact_avatar")}</SubTitle>
        <PicWrapper>
          {contact.avatarId && !avatarLoading ? (
            <ContactPic src={contact.profileIcon} />
          ) : (
            avatarLoading &&
            contact.avatarId && (
              <AutoContactPic>
                <LoadingSpin />
              </AutoContactPic>
            )
          )}
          {!contact.profileIcon && svgieAvatar && (
            <ContactPic src={svgieAvatar} />
          )}
          {!contact.profileIcon && !svgieAvatar && (
            <AutoContactPic>
              {generateProfileIcon(contact.name, contact.address)}
            </AutoContactPic>
          )}
          {editable ? (
            <>
              <label htmlFor="avatarUpload" style={{ cursor: "pointer" }}>
                <UploadIcon />
              </label>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarUpload}
              />
            </>
          ) : null}
        </PicWrapper>
        {contact.name && <SubTitle>{browser.i18n.getMessage("name")}</SubTitle>}
        {editable ? (
          <InputWrapper>
            <InputV2
              fullWidth
              name="name"
              placeholder={
                contact.name
                  ? contact.name
                  : browser.i18n.getMessage("first_last_name")
              }
              value={contact.name}
              onChange={handleInputChange}
            />
          </InputWrapper>
        ) : (
          <ContactInfo>{contact.name}</ContactInfo>
        )}
        <AddressWrapper>
          <SubTitle>
            {browser.i18n.getMessage("arweave_account_address")}
            {editable && "*"}
          </SubTitle>
          {!editable && (
            <TooltipV2
              content={browser.i18n.getMessage("copy_address")}
              position="top"
            >
              <Action
                as={copied ? CheckIcon : CopyIcon}
                onClick={copyAddress}
              />
            </TooltipV2>
          )}
        </AddressWrapper>
        {editable ? (
          <InputWrapper>
            <InputV2
              fullWidth
              name="address"
              placeholder={
                contact.address
                  ? contact.address
                  : browser.i18n.getMessage("account_address")
              }
              value={contact.address}
              onChange={handleInputChange}
            />
          </InputWrapper>
        ) : (
          <Address>{contact.address}</Address>
        )}
        {<>{renderArNSAddress()}</>}
        <SubTitle>{browser.i18n.getMessage("notes")}</SubTitle>
        <ContactNotes
          placeholder={browser.i18n.getMessage("type_message_here")}
          value={contact.notes || ""}
          onChange={(e) => setContact({ ...contact, notes: e.target.value })}
          style={{ height: editable ? "235px" : "269px" }}
        />
      </div>
      {editable && (
        <>
          <Footer>
            <ButtonV2
              fullWidth
              onClick={saveContact}
              disabled={areFieldsEmpty()}
            >
              {browser.i18n.getMessage("save_changes")}
            </ButtonV2>
            <RemoveContact
              fullWidth
              secondary
              onClick={() => removeContactModal.setOpen(true)}
              displayTheme={theme}
            >
              {browser.i18n.getMessage("remove_contact")}
            </RemoveContact>
          </Footer>
          <ModalV2
            {...removeContactModal.bindings}
            root={document.getElementById("__plasmo")}
            actions={
              <>
                <ButtonV2
                  secondary
                  onClick={() => removeContactModal.setOpen(false)}
                >
                  {browser.i18n.getMessage("no")}
                </ButtonV2>
                <ButtonV2 onClick={confirmRemoveContact}>
                  {browser.i18n.getMessage("yes")}
                </ButtonV2>
              </>
            }
          >
            <CenterText heading>
              {browser.i18n.getMessage("remove_contact")}
            </CenterText>
            <Spacer y={0.55} />
            <CenterText noMargin>
              {browser.i18n.getMessage("remove_contact_question")}
            </CenterText>
            <Spacer y={1} />
          </ModalV2>
        </>
      )}
    </Wrapper>
  );
}

const Action = styled(CopyIcon)`
  font-size: 1.25rem;
  width: 1em;
  height: 1em;
  color: rgb(${(props) => props.theme.secondaryText});
  transition: all 0.23s ease-in-out;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.92);
  }
`;

const LoadingSpin = styled(Loading)`
  height: 23px;
  width: 23px;
`;

const Link = styled(Share04)`
  margin-left: 10px;
  cursor: pointer;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0px;
`;

export const CenterText = styled(Text)`
  text-align: center;
  max-width: 22vw;
  margin: 0 auto;

  @media screen and (max-width: 720px) {
    max-width: 90vw;
  }
`;

const Address = styled(Text).attrs({
  heading: true
})`
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  word-break: break-all;
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.37rem;
`;

export const PicWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const UploadIcon = styled(Upload01)`
  cursor: pointer;
`;

const EditIcon = styled(Edit02)`
  cursor: pointer;
`;

export const RemoveContact = styled(ButtonV2)<{ displayTheme: DisplayTheme }>`
  // props.theme.delete
  background-color: ${(props) =>
    props.displayTheme === "light" ? "#F58080" : "#8C1A1A"};
  border: 1.5px solid ${(props) => props.theme.fail};
  color: #ffffff;

  &:hover {
    background-color: ${(props) =>
      props.displayTheme === "light" ? "#F58080" : "#C51A1A"};
  }
`;

export const AutoContactPic = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 100%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 44px;
  background-color: #ab9aff26;
`;

export const ContactPic = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 100%;
  margin-bottom: 10px;
`;

export const InputWrapper = styled.div`
  margin-bottom: 10px;
`;

export const SelectInput = styled(SelectV2)`
  height: 53px;
  padding: 10px 20px 10px 20px;
  color: #b9b9b9;
  font-size: 16px;
  ::placeholder {
    color: #b9b9b9;
    font-size: 16px;
  }
`;

export const ContactInput = styled(InputV2)`
  height: 33px;
  padding: 10px 20px 10px 20px;
  color: #b9b9b9;
  font-size: 16px;
  ::placeholder {
    color: #b9b9b9;
    font-size: 16px;
  }
`;

const ContactInfo = styled(Text).attrs({
  heading: true
})`
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

export const ContactNotes = styled.textarea`
  display: flex;
  width: 96%;
  border-radius: 15px;
  border: 1.5px solid #ab9aff26;
  padding: 12px;
  background-color: #ab9aff26;
  font-size: 16px;
  ::placeholder {
    color: #b9b9b9;
    font-size: 16px;
  }
  &:focus {
    outline: none;
  }
  caret-color: #b9b9b9;
  color: #b9b9b9;
`;

export const SubTitle = styled(Text)`
  font-size: 16px;
  color: #aeadcd;
  margin-bottom: 4px;
`;

export const Title = styled(Text).attrs({
  title: true
})`
  font-weight: 600;
  margin-bottom: 10px;
`;

interface Props {
  address: string;
}
