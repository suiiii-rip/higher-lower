import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
  getFrameMessage,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";
import { getTokenUrl } from "frames.js";

type State = {
  phase: "init" | "playing" | "played";
  number: number | null;
  hiddenNumber: number | null;
};

const initialState: State = { phase: "init", number: null, hiddenNumber: null };

const randomNumber = () => Math.ceil(Math.random() * 10);

const reducer: FrameReducer<State> = (state, action) => {
  if (state.phase === "init" || state.phase === "played") {
    return {
      phase: "playing",
      number: randomNumber(),
      hiddenNumber: null,
    };
  }
  // state.phase === 'playing'
  return {
    phase: "played",
    number: state.number,
    hiddenNumber: randomNumber(),
  };
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
    fetchHubContext: false,
  });

  // if (frameMessage && !frameMessage?.isValid) {
  //   throw new Error("Invalid frame payload");
  // }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame,
  );

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT

  // Example with satori and sharp:
  // const imageUrl = await
  frameMessage;

  console.log("info: state is:", state);

  if (frameMessage) {
    // const {
    //   isValid,
    //   buttonIndex,
    //   inputText,
    //   castId,
    //   requesterFid,
    //   casterFollowsRequester,
    //   requesterFollowsCaster,
    //   likedCast,
    //   recastedCast,
    //   requesterVerifiedAddresses,
    //   requesterUserData,
    // } = frameMessage;

    console.log("info: frameMessage is:", frameMessage);
  }
  // console.log('previousFrame', previousFrame);

  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

  // then, when done, return next frame
  return (
    <div className="p-4">
      frames.js starter kit.{" "}
      <Link href={`/debug?url=${baseUrl}`} className="underline">
        Debug
      </Link>
      {state.phase === "init" ? (
        <FrameContainer
          postUrl="/frames"
          state={state}
          previousFrame={previousFrame}
        >
          {/* <FrameImage src="https://framesjs.org/og.png" /> */}
          <FrameImage>
            <div tw="flex flex-col w-full h-full bg-slate-700 text-white justify-center items-center">
              <p>Higher or Lower?</p>
            </div>
          </FrameImage>
          <FrameButton onClick={dispatch}>Play!</FrameButton>
        </FrameContainer>
      ) : null}
      {state.phase === "playing" ? (
        <FrameContainer
          postUrl="/frames"
          state={state}
          previousFrame={previousFrame}
        >
          {/* <FrameImage src="https://framesjs.org/og.png" /> */}
          <FrameImage>
            <div tw="flex flex-col w-full h-full bg-slate-700 text-white justify-center items-center">
              <p tw="text-9xl">{state.number}</p>
              <p>Higher or Lower?</p>
            </div>
          </FrameImage>
          <FrameButton onClick={dispatch}>Lower</FrameButton>
          <FrameButton onClick={dispatch}>Higher</FrameButton>
        </FrameContainer>
      ) : null}
      {state.phase === "played" ? (
        <FrameContainer
          postUrl="/frames"
          state={state}
          previousFrame={previousFrame}
        >
          {/* <FrameImage src="https://framesjs.org/og.png" /> */}
          <FrameImage>
            <div tw="flex flex-col w-full h-full bg-slate-700 text-white justify-center items-center">
              {(previousFrame.postBody?.untrustedData.buttonIndex === 1) ===
                state.number! > state.hiddenNumber! && state.number! !== state.hiddenNumber! ? (
                <p tw="text-green-600">You Won</p>
              ) : (
                <p tw="text-red-600">You Lost</p>
              )}
              <p tw="text-4xl">The number was:</p>
              <p tw="text-9xl">{state.hiddenNumber}</p>
            </div>
          </FrameImage>
          <FrameButton onClick={dispatch}>Play Again!</FrameButton>
        </FrameContainer>
      ) : null}
    </div>
  );
}
